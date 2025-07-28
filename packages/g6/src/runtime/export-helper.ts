import type { Canvas as GCanvas } from '@antv/g';
import type { ExportablePlugin, PluginExportContext, SSRPluginExportContext } from '../plugins/types';
import { isSSR } from '../utils/env';
import { print } from '../utils/print';
import type { RuntimeContext } from './types';

/**
 * <zh/> 导出辅助类
 *
 * <en/> Export helper class
 * @remarks
 * <zh/> 负责协调各插件在图片导出时的渲染逻辑
 *
 * <en/> Responsible for coordinating plugin rendering logic during image export
 */
export class ExportHelper {
  constructor(private context: RuntimeContext) {}

  /**
   * <zh/> 渲染所有可导出插件到离屏画布
   *
   * <en/> Render all exportable plugins to offscreen canvas
   * @param offscreenCanvas - <zh/> 离屏画布 | <en/> Offscreen canvas
   * @param exportContext - <zh/> 导出上下文 | <en/> Export context
   */
  public async renderPluginsToCanvas(
    offscreenCanvas: GCanvas,
    exportContext: Omit<PluginExportContext, 'offscreenCanvas'>,
  ): Promise<void> {
    const plugins = this.getExportablePlugins();

    if (plugins.length === 0) return;

    // 检测当前环境并选择相应的渲染策略
    // Detect current environment and choose appropriate rendering strategy
    if (isSSR()) {
      await this.renderPluginsInSSR(offscreenCanvas, exportContext, plugins);
    } else {
      await this.renderPluginsInBrowser(offscreenCanvas, exportContext, plugins);
    }
  }

  /**
   * <zh/> 在浏览器环境中渲染插件
   *
   * <en/> Render plugins in browser environment
   * @param offscreenCanvas - <zh/> 离屏画布 | <en/> Offscreen canvas
   * @param exportContext - <zh/> 导出上下文 | <en/> Export context
   * @param plugins - <zh/> 可导出插件列表 | <en/> List of exportable plugins
   */
  private async renderPluginsInBrowser(
    offscreenCanvas: GCanvas,
    exportContext: Omit<PluginExportContext, 'offscreenCanvas'>,
    plugins: ExportablePlugin[],
  ): Promise<void> {
    const context: PluginExportContext = {
      offscreenCanvas,
      ...exportContext,
    };

    // 并行处理所有可导出插件
    // Process all exportable plugins in parallel
    const renderPromises = plugins.map((plugin) => {
      if (!plugin.renderToExportCanvas) return Promise.resolve();

      return plugin.renderToExportCanvas(context).catch((error) => {
        // 记录插件渲染错误，便于调试
        // Log plugin rendering errors for debugging
        const pluginName = plugin.constructor.name || 'UnknownPlugin';
        const errorMessage = error.message || String(error);
        print.warn(`Plugin export rendering failed: ${pluginName} - ${errorMessage}`);
        // 抛出错误以允许上层处理，但不会中断其他插件的渲染
        // Throw error to allow upper layer handling, but won't interrupt other plugins' rendering
        throw error;
      });
    });

    await Promise.allSettled(renderPromises);
  }

  /**
   * <zh/> 在SSR环境中渲染插件
   *
   * <en/> Render plugins in SSR environment
   * @param offscreenCanvas - <zh/> 离屏画布 | <en/> Offscreen canvas
   * @param exportContext - <zh/> 导出上下文 | <en/> Export context
   * @param plugins - <zh/> 可导出插件列表 | <en/> List of exportable plugins
   */
  private async renderPluginsInSSR(
    offscreenCanvas: GCanvas,
    exportContext: Omit<PluginExportContext, 'offscreenCanvas'>,
    plugins: ExportablePlugin[],
  ): Promise<void> {
    // 过滤出支持SSR的插件
    // Filter plugins that support SSR
    const ssrCompatiblePlugins = plugins.filter(
      (plugin) => plugin.supportsSSRExport?.() && plugin.renderToExportCanvasSSR,
    );

    if (ssrCompatiblePlugins.length === 0) {
      print.warn('No SSR-compatible plugins found for export rendering');
      return;
    }

    const context: SSRPluginExportContext = {
      offscreenCanvas,
      ...exportContext,
      pluginOptions: {}, // 这将被每个插件覆盖
    };

    // 并行处理所有SSR兼容的插件
    // Process all SSR-compatible plugins in parallel
    const renderPromises = ssrCompatiblePlugins.map((plugin) => {
      return plugin.renderToExportCanvasSSR!(context).catch((error) => {
        // 记录插件渲染错误，便于调试
        // Log plugin rendering errors for debugging
        const pluginName = plugin.constructor.name || 'UnknownPlugin';
        const errorMessage = error.message || String(error);
        print.warn(`Plugin SSR export rendering failed: ${pluginName} - ${errorMessage}`);
        // 抛出错误以允许上层处理，但不会中断其他插件的渲染
        // Throw error to allow upper layer handling, but won't interrupt other plugins' rendering
        throw error;
      });
    });

    await Promise.allSettled(renderPromises);
  }

  /**
   * <zh/> 获取所有支持导出的插件
   *
   * <en/> Get all plugins that support export
   */
  private getExportablePlugins(): ExportablePlugin[] {
    const pluginController = this.context.plugin;
    if (!pluginController) {
      return [];
    }

    // 使用公共API获取插件实例，而不是访问内部属性
    // Use public API to get plugin instances instead of accessing internal properties
    const pluginInstances = pluginController.getPluginInstances();

    const exportablePlugins: ExportablePlugin[] = [];

    for (const plugin of pluginInstances) {
      if (
        plugin &&
        typeof plugin === 'object' &&
        'renderToExportCanvas' in plugin &&
        typeof plugin.renderToExportCanvas === 'function'
      ) {
        exportablePlugins.push(plugin as ExportablePlugin);
      }
    }

    return exportablePlugins;
  }
}
