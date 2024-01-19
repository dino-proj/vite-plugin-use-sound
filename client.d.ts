declare module 'virtual:use-sound' {
  /**
   * 声音播放器接口
   */
  export interface AudioPlayer {
    /**
     * 播放声音
     */
    play: (src?: string) => void;
    /**
     * 暂停声音
     */
    pause: () => void;
    /**
     * 停止声音
     */
    stop: () => void;
    /**
     * 销毁声音
     */
    destroy: () => void;
    /**
     * 播放完成回调
     */
    onPlayEnded: (cb: () => any) => void;
  }

  /**
   * 声音播放器创建器类型
   */
  export type AudioPlayerCreator<T> = (url: string) => T;

  export type UseSound = <T>(
    /**
     * 声音的唯一标识符, 或者声音的 URL
     * - 如果传入的是声音的 URL, 则会播放这个声音
     * - 如果传入的是声音的唯一标识符, 则会播放这个标识符对应的声音
     * - 如果传入的是声音的唯一标识符, 但是没有找到对应的声音, 则会抛出异常
     * - 如果传入的是undefined, 则返回一个空的声音播放器，调用play方法时需传入声音的URL
     */
    idOrUrl?: string,
    /**
     * 声音播放器创建器
     * - 如果不传入, 则使用默认的 `Audio` 创建器
     * - 如果传入, 则使用传入的创建器创建
     * - 改变默认的创建器, 可以使用 `setupUseSound` 函数
     * @default 使用 `Audio` 创建
     */
    audioPlayerCreator?: AudioPlayerCreator<T>
  ) => {
    /**
     * 声音的 URL
     */
    url: string;
    /**
     * 声音播放器实例
     */
    player: T;
  } & AudioPlayer;

  export const useSound: UseSound;

  export type SetupUseSound = <T>(audioPlayerCreator: AudioPlayerCreator<T>) => void;

  export const setupUseSound: SetupUseSound;

  export default useSound;
}

declare module 'virtual:use-sound-ids' {
  const ids: string[];
  export default ids;
}
