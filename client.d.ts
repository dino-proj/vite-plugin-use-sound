declare module 'virtual:use-sound' {
  /**
   * 声音播放器接口
   */
  export interface AudioPlayer {
    /**
     * 播放声音
     */
    play: () => void;
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
  }

  /**
   * 声音播放器创建器类型
   */
  export type AudioPlayerCreator<T> = (url: string) => T;

  export type UseSound = <T>(
    /**
     * 声音的唯一标识符
     */
    id: string,
    /**
     * 声音播放器创建器
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

  export default useSound;
}

declare module 'virtual:use-sound-ids' {
  const ids: string[];
  export default ids;
}
