/**
 * Rehype plugin: 将超过指定行数的代码块包裹为可折叠的 <details>/<summary>
 * @param {object} options
 * @param {number} [options.lineThreshold=15] - 超过此行数时折叠，默认 15
 * @param {string} [options.summaryExpand='展开代码'] - 折叠时按钮文案
 * @param {string} [options.summaryCollapse='折叠代码'] - 展开时按钮文案（可用 JS 动态改）
 */
export default function rehypeCollapsibleCode(options = {}) {
  const {
    lineThreshold = 15,
    summaryExpand = '展开代码',
    summaryCollapse = '折叠代码',
  } = options;

  /** 从 hast 节点递归取纯文本 */
  function getText(node) {
    if (!node) return '';
    if (node.type === 'text') return node.value || '';
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(getText).join('');
    }
    return '';
  }

  /** 递归遍历并替换 pre */
  function visit(node, index, parent) {
    if (!node || !parent) return;
    if (node.type === 'element' && node.tagName === 'pre') {
      const text = getText(node);
      const lines = (text.match(/\n/g) || []).length + 1;
      if (lines > lineThreshold) {
        const summaryNode = {
          type: 'element',
          tagName: 'summary',
          properties: {
            className: ['collapsible-code-summary'],
            'data-expand': summaryExpand,
            'data-collapse': summaryCollapse,
          },
          children: [{ type: 'text', value: summaryExpand }],
        };
        const detailsNode = {
          type: 'element',
          tagName: 'details',
          properties: { className: ['collapsible-code-details'] },
          children: [summaryNode, node],
        };
        parent.children[index] = detailsNode;
      }
      return;
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child, i) => visit(child, i, node));
    }
  }

  return function (tree) {
    if (tree.children && Array.isArray(tree.children)) {
      tree.children.forEach((child, i) => visit(child, i, tree));
    }
  };
}
