# vite-plugin-use-sound

**English** | [中文](./README.zh_CN.md)

Used to generate sound file to base64 url data.

## Feature

- **Preloading** All sound are generated when the project is running, and you only need to play.
- **High performance** Built-in cache, it will be regenerated only when the file is modified.

## Installation (yarn or npm)

**node version:** >=12.0.0

**vite version:** >=4.0.0

```bash
yarn add vite-plugin-use-sound -D
# or
npm i vite-plugin-use-sound -D
# or
pnpm install vite-plugin-use-sound -D
```

## Usage

### Configuration plugin in vite.config.ts

```ts
import { createUseSoundPlugin } from 'vite-plugin-use-sound'
import path from 'path'

export default () => {
  return {
    plugins: [
      createUseSoundPlugin({
        // Specify the sound folder to be convert
        soundDirs: [path.resolve(process.cwd(), 'src/assets/sound')],
        // Specify symbolId format
        symbolId: 'sound-[dir]-[name]',

      }),
    ],
  }
}

```

### Setup in src/main.ts **[Optional]**

```ts
import { setupUseSound } from 'virtual:use-sound'

// setup useSound use `uni.createInnerAudioContext` as player creator
setupUseSound((url: string) => {
  const player = uni.createInnerAudioContext()
  player.src = url
  player.autoplay = false

  player.onPlay(() => {
    console.log('音频开始播放')
  })

  player.onError((error: any) => {
    console.error('音频播放出错：', error)
  })
  return player
})
```


> **Note:**
>
> If you don't call `setupUseSound`, the default player is `new Audio()`

## How to use in components

#### **Sound Directory Structure**

```bash
# src/sound

- option-error.mp3
- option-success.wav
- sound3.m4a
- dir/sound4.aac
```

### **Vue way**

`/src/pages/Home.vue`

```vue
<template>
  <button @click="playSuccess()">play</button>
</template>

<script lang='ts' setup>
import { useSound } from 'virtual:use-sound'

// 错误提示音
const errorSound = useSound('sound-option-error')
errorSound.play()

// 正确提示音
const {play: playSuccess, destroy: destroySuccess} = useSound('sound-option-success')

// 声音播放器
const wordPlayer = useSound()
wordPlayer.onPlayEnded(() => {
  console.log('播放结束')
})

onUnload(() => {
  // 销毁声音特效
  errorSound.destroy()
  destroySuccess()
  wordPlayer.destroy()
})

</script>
```

### Get all SymbolId

```ts
import ids from 'virtual:use-sound-ids'
// => ['sound-option-error','sound-option-success','sound-sound3', 'sound-dir-sound4']
```

### Options

| Parameter | Type       | Default              | Description                                    |
|-----------|------------|----------------------|------------------------------------------------|
| soundDirs | `string[]` | -                    | Need to generate the sound folders             |
| symbolId  | `string`   | `sound-[dir]-[name]` | sound symbolId format, see the description below |

**symbolId**

`sound-[dir]-[name]`

**[name]:**

sound file name

**[dir]**

The sound of the plug-in will not generate hash to distinguish, but distinguish it by folder.

If the folder corresponding to `soundDirs` contains this other folder

example:

Then the generated SymbolId is written in the comment

```bash
# src/sound
- sound1.wav # sound-sound1
- sound2.wav # sound-sound2
- sound3.wav # sound-sound3
- dir/sound1.wav # sound-dir-sound1
- dir/dir2/sound1.wav # sound-dir-dir2-sound1
```

### Support file format

- mp3
- wav
- m4a
- aac

## Typescript Support

If using `Typescript`, you can add in `tsconfig.json`

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite-plugin-use-sound/client"]
  }
}
```

> **Note:**
>
> Although the use of folders to distinguish between them can largely avoid the problem of duplicate names, there will also be sounds with multiple folders and the same file name in `soundDirs`.
>
> This needs to be avoided by the developer himself.

## License

[MIT © Dinodev.cn](./LICENSE)