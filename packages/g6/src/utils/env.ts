/**
 * <zh/> 环境检测工具函数
 *
 * <en/> Environment detection utility functions
 */

/**
 * <zh/> 检测是否在服务端渲染环境
 *
 * <en/> Check if running in server-side rendering environment
 * @returns <zh/> 是否为SSR环境 | <en/> Whether it's SSR environment
 */
export function isSSR(): boolean {
  return typeof window === 'undefined' || typeof document === 'undefined';
}

/**
 * <zh/> 检测是否在浏览器环境
 *
 * <en/> Check if running in browser environment
 * @returns <zh/> 是否为浏览器环境 | <en/> Whether it's browser environment
 */
export function isBrowser(): boolean {
  return !isSSR();
}

/**
 * <zh/> 安全地获取window对象
 *
 * <en/> Safely get window object
 * @returns <zh/> window对象或undefined | <en/> window object or undefined
 */
export function safeWindow(): Window | undefined {
  return isSSR() ? undefined : window;
}

/**
 * <zh/> 安全地获取document对象
 *
 * <en/> Safely get document object
 * @returns <zh/> document对象或undefined | <en/> document object or undefined
 */
export function safeDocument(): Document | undefined {
  return isSSR() ? undefined : document;
}
