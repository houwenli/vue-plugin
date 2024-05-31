/**重置message，防止重复点击重复弹出message弹框 */
import {
    Message
} from 'element-ui';

let messageStack = new Set();

const resetMessage = (options) => {
    options = options || {};
    if (typeof options === 'string') {
        options = {
            message: options
        };
    }
    return showMessage(options);
};
['success', 'warning', 'info', 'error'].forEach(type => {
    resetMessage[type] = (options) => {
        if (typeof options === 'string') {
            options = {
                message: options
            };
        }
        options.type = type;
        return showMessage(options);
    };
});

const showMessage = (options) => {
    if (messageStack.has(options.message)) {
        return;
    }
    messageStack.add(options.message);
    return Message({
        showClose: true,
        ...options,
        onClose: (o) => messageStack.delete(o.message)
    })
}

export default resetMessage
