import { Plugin, normalizePath } from 'vite';
import getEtag from 'etag';
import cors from 'cors';
import fg from 'fast-glob';
import path from 'path';
import fs from 'fs';

const USE_SOUND_MODULE_NAME = 'virtual:use-sound';
const USE_SOUND_IDS_MODULE_NAME = 'virtual:use-sound-ids';

export interface ViteUseSoundPlugin {
  /**
   * sounds folder, all sound files in it will be converted to sound sprite.
   */
  soundDirs: string[];

  /**
   * sound id format
   * @default: sound-[dir]-[name]
   */
  symbolId?: string;
}

interface FileStats {
  relativeName: string;
  mtimeMs?: number;
  code: string;
  symbolId: string;
}

export const createUseSoundPlugin = (opt: ViteUseSoundPlugin): Plugin => {
  let isBuild = false;
  const cache = new Map<string, FileStats>();

  const options = {
    symbolId: 'sound-[dir]-[name]',
    ...opt,
  };

  return {
    name: 'vite:sound-sprite',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    resolveId(id) {
      if (id === USE_SOUND_MODULE_NAME || id === USE_SOUND_IDS_MODULE_NAME) {
        return id;
      }
      return null;
    },

    async load(id, ssr) {
      if (!isBuild && !ssr) {
        return null;
      }
      const isSsr = ssr && !isBuild;
      const isRegister = id === USE_SOUND_MODULE_NAME;
      const isClient = id === USE_SOUND_IDS_MODULE_NAME;

      if (isSsr && (isRegister || isClient)) {
        return `export default {}`;
      }
      const { code, idSet } = await createSoundModuleCode(cache, options);

      if (isRegister) {
        return code;
      }
      if (isClient) {
        return idSet;
      }
    },

    configureServer: ({ middlewares }) => {
      middlewares.use(cors({ origin: '*' }));
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!);

        const registerId = `/@id/${USE_SOUND_MODULE_NAME}`;
        const clientId = `/@id/${USE_SOUND_IDS_MODULE_NAME}`;
        if ([clientId, registerId].some((item) => url.endsWith(item))) {
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-cache');
          const { code, idSet } = await createSoundModuleCode(cache, options);
          const content = url.endsWith(registerId) ? code : idSet;

          res.setHeader('Etag', getEtag(content, { weak: true }));
          res.statusCode = 200;
          res.end(content);
        } else {
          next();
        }
      });
    },
  };
};

const createSoundModuleCode = async (cache: Map<string, FileStats>, options: ViteUseSoundPlugin): Promise<{ code: string; idSet: string }> => {
  const { idSet, urlMap } = await compilerSounds(cache, options);
  const code = `
  const soundUrls = {
    ${Array.from(urlMap)
      .map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
      .join(',\n')}
  }

  function defaultAudioPlayerCreator(url) {
    const audioContext = new Audio();
    audioContext.src = url;
    audioContext.autoplay = false;
    return audioContext;
  }

  export function useSound(id, audioPlayerCreator = defaultAudioPlayerCreator) {
    const url = soundUrls[id];
    if (!url) {
      throw new Error(\`Sound id \${id} not found\`);
    }
    const audioContext = audioPlayerCreator(url);
    return {
      url: url,
      player: audioContext,
      play: () => {
        if(audioContext.seek){
          audioContext.seek(0);
        }else if(audioContext.currentTime){
          audioContext.currentTime = 0;
        }
        audioContext.play()
      },
      pause: () => audioContext.pause(),
      stop: () => audioContext.pause(),
      destroy: () => {
        audioContext.pause();
        audioContext.src = null;
        if(audioContext.destroy){
          audioContext.destroy();
        }
      },
    }
  }
    `;

  return {
    code: `${code}\nexport default { }`,
    idSet: `export default ${JSON.stringify(Array.from(idSet))}`,
  };
};

export async function compilerSounds(cache: Map<string, FileStats>, options: ViteUseSoundPlugin) {
  const { soundDirs } = options;

  const idSet = new Set<string>();
  const urlMap = new Map<string, string>();

  for (const dir of soundDirs) {
    const soundFilsStats = fg.sync(['**/*.mp3', '**/*.wav', '**/*.m4a', '**/*.aac'], {
      cwd: dir,
      stats: true,
      absolute: true,
    });

    for (const fileStats of soundFilsStats) {
      const { path: filePath, stats: { mtimeMs } = {} } = fileStats;

      let cachedStat = cache.get(filePath);

      if (!cachedStat || cachedStat.mtimeMs !== mtimeMs) {
        cachedStat = compileSound(dir, filePath, mtimeMs, options);
        cache.set(filePath, cachedStat);
      }

      idSet.add(cachedStat.symbolId);
      urlMap.set(cachedStat.symbolId, cachedStat.code);
    }
  }

  return { idSet, urlMap };
}

const compileSound = (dir: string, filePath: string, mtimeMs: number | undefined, options: ViteUseSoundPlugin): FileStats => {
  const relativeName = normalizePath(filePath).substring(normalizePath(dir).length);

  return {
    relativeName: relativeName,
    mtimeMs: mtimeMs,
    code: toBase64DataUrl(filePath),
    symbolId: createSymbolId(relativeName, options.symbolId),
  };
};

const toBase64DataUrl = (filePath: string): string => {
  const ext = path.extname(filePath).substring(1);
  const base64 = fs.readFileSync(filePath, 'base64');
  return `data:audio/${ext};base64,${base64}`;
};

const createSymbolId = (relativeName: string, symbolIdPattern?: string): string => {
  if (!symbolIdPattern) {
    return relativeName;
  }
  return symbolIdPattern.replace('[dir]', path.dirname(relativeName)).replace('[name]', path.basename(relativeName, path.extname(relativeName)));
};
