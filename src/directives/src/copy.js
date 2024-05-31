import { Message } from 'element-ui';
export default {
    bind(el, { value }) {
        el._value = value || el.innerText;
        el._handle = () => {
            if (!el._value) {
                Message.error('内容不能为空');
                return;
            }
            // 动态创建textarea标签（input只能复制单行）
            let textarea = document.createElement('textarea');
            // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
            textarea.readOnly = 'readonly';
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            textarea.value = el._value;
            // 将textarea插入body
            document.body.append(textarea);
            // 选中值并复制
            textarea.select();
            let result = document.execCommand('Copy');
            if (result) {
                Message.success('复制成功');
            }
            document.body.removeChild(textarea);
        };
        // 绑定事件
        el.addEventListener('click', el._handle);
    },
    componentUpdated(el, { value }) {
        el._value = value;
    },
    unbind(el) {
        el.removeEventListener('click', el._handle);
        delete el._handle;
    }
};
