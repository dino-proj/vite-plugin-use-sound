# vite-plugin-use-sound
**中文** | [English](./README.md)

用于将声音文件生成为 base64 url 数据。

## 功能

- **预加载** 所有声音在项目运行时生成，只需播放即可。
- **高性能** 内置缓存，仅在文件修改时重新生成。

## 安装 (使用 yarn 或 npm)

**node 版本:** >=12.0.0

**vite 版本:** >=4.0.0


```bash
yarn add vite-plugin-use-sound -D
# or
npm i vite-plugin-use-sound -D
# or
pnpm install vite-plugin-use-sound -D
```

## 使用方法

### 在 vite.config.ts 中配置插件

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

### 在 `src/main.ts`中设置 **[Optional]**

```ts
import { setupUseSound } from 'virtual:use-sound'

// 使用 `uni.createInnerAudioContext` 作为播放器创建器的 useSound 设置
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


> **注意：**
>
> 如果你不调用 `setupUseSound`，默认的播放器是 `new Audio()`

## 在组件中使用

#### **声音目录结构**

```bash
# src/sound

- option-error.mp3
- option-success.wav
- sound3.m4a
- dir/sound4.aac
```

### **Vue 方式**

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

### 获取所有的 SymbolId

```ts
import ids from 'virtual:use-sound-ids'
// => ['sound-option-error','sound-option-success','sound-sound3', 'sound-dir-sound4']
```

### 选项

| 参数       | 类型         | 默认值                | 描述                                           |
|------------|--------------|-----------------------|------------------------------------------------|
| soundDirs  | `string[]`   | -                     | 需要生成声音文件夹的路径                         |
| symbolId   | `string`     | `sound-[dir]-[name]`  | 声音的 symbolId 格式，详见下方的描述             |

**symbolId**

`sound-[dir]-[name]`

**[name]:**

sound file name

**[dir]**

插件的声音不会通过哈希值进行区分，而是通过文件夹进行区分。

如果与 `soundDirs` 对应的文件夹包含其他文件夹，则生成的 SymbolId 将写在注释中。
例如：

```bash
# src/sound
- sound1.wav # sound-sound1
- sound2.wav # sound-sound2
- sound3.wav # sound-sound3
- dir/sound1.wav # sound-dir-sound1
- dir/dir2/sound1.wav # sound-dir-dir2-sound1
```

### 支持的声音文件格式

- mp3
- wav
- m4a
- aac

## Typescript Support

如果使用 `Typescript`，可以在 `tsconfig.json` 中添加以下配置：

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
> 尽管使用文件夹来区分它们可以在很大程度上避免重复名称的问题，但在 `soundDirs` 中可能会出现具有多个文件夹和相同文件名的声音。
>
> 这需要开发者自己避免。

## License

[MIT © Dinodev.cn](./LICENSE)