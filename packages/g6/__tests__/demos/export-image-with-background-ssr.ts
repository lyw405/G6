import { Graph } from '@antv/g6';

export async function exportImageWithBackgroundSSR() {
  // 模拟SSR环境的数据
  // Simulate SSR environment data
  const data = {
    nodes: [
      { id: 'node-1', style: { x: 50, y: 50 } },
      { id: 'node-2', style: { x: 200, y: 150 } },
      { id: 'node-3', style: { x: 350, y: 100 } },
    ],
    edges: [
      { source: 'node-1', target: 'node-2' },
      { source: 'node-2', target: 'node-3' },
    ],
  };

  const graph = new Graph({
    container: 'container',
    width: 500,
    height: 300,
    data,
    plugins: [
      {
        type: 'background',
        key: 'background',
        backgroundColor: '#f0f0f0',
        backgroundImage:
          'url(https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*0Qq0ToQm1rEAAAAAAAAAAAAADmJ7AQ/original)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.6,
      },
    ],
  });

  await graph.render();

  // 等待渲染完成
  // Wait for rendering to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 导出图片
  // Export image
  const dataURL = await graph.toDataURL({
    mode: 'viewport',
    type: 'image/png',
  });

  console.log('Exported image data URL length:', dataURL.length);

  // 在页面上显示导出的图片
  // Display exported image on the page
  const exportedImage = document.createElement('img');
  exportedImage.src = dataURL;
  exportedImage.style.border = '2px solid #007bff';
  exportedImage.style.borderRadius = '8px';
  exportedImage.style.marginTop = '20px';
  exportedImage.style.maxWidth = '100%';
  exportedImage.title = 'Exported Image with Background';

  const container = document.getElementById('container');
  if (container && container.parentNode) {
    container.parentNode.appendChild(exportedImage);
  }

  return { dataURL, graph };
}

// 这个演示展示了背景插件在SSR环境中的自动检测和适配
// This demo shows automatic detection and adaptation of background plugin in SSR environment
