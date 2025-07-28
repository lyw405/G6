import type { Canvas as GCanvas, ICamera } from '@antv/g';
import type { BasePlugin } from './base-plugin';

export type Plugin = BasePlugin<any>;

/**
 * <zh/> 插件导出上下文
 *
 * <en/> Plugin export context
 */
export interface PluginExportContext {
  /** <zh/> 离屏画布 | <en/> Offscreen canvas */
  offscreenCanvas: GCanvas;
  /** <zh/> 导出模式 | <en/> Export mode */
  mode: 'viewport' | 'overall';
  /** <zh/> 设备像素比 | <en/> Device pixel ratio */
  devicePixelRatio: number;
  /** <zh/> 变换参数 | <en/> Transform parameters */
  transform: {
    startX: number;
    startY: number;
    camera: ICamera;
    offscreenCamera: ICamera;
  };
}

/**
 * <zh/> SSR 插件导出上下文
 *
 * <en/> SSR plugin export context
 */
export interface SSRPluginExportContext {
  /** <zh/> 离屏画布 | <en/> Offscreen canvas */
  offscreenCanvas: GCanvas;
  /** <zh/> 导出模式 | <en/> Export mode */
  mode: 'viewport' | 'overall';
  /** <zh/> 设备像素比 | <en/> Device pixel ratio */
  devicePixelRatio: number;
  /** <zh/> 变换参数 | <en/> Transform parameters */
  transform: {
    startX: number;
    startY: number;
    camera: ICamera;
    offscreenCamera: ICamera;
  };
  /** <zh/> 插件配置选项 (用于替代DOM计算样式) | <en/> Plugin configuration options (to replace DOM computed styles) */
  pluginOptions: Record<string, any>;
}

/**
 * <zh/> 支持导出的插件接口
 *
 * <en/> Plugin interface that supports export
 */
export interface ExportablePlugin {
  /**
   * <zh/> 将插件内容渲染到导出画布 (浏览器环境)
   *
   * <en/> Render plugin content to export canvas (browser environment)
   * @param context - <zh/> 导出上下文 | <en/> Export context
   */
  renderToExportCanvas?(context: PluginExportContext): Promise<void>;

  /**
   * <zh/> 将插件内容渲染到导出画布 (SSR环境)
   *
   * <en/> Render plugin content to export canvas (SSR environment)
   * @param context - <zh/> SSR导出上下文 | <en/> SSR export context
   */
  renderToExportCanvasSSR?(context: SSRPluginExportContext): Promise<void>;

  /**
   * <zh/> 检查插件是否支持SSR导出
   *
   * <en/> Check if plugin supports SSR export
   * @returns <zh/> 是否支持SSR | <en/> Whether SSR is supported
   */
  supportsSSRExport?(): boolean;
}
