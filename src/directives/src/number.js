export default {
    inserted(el, binding, vnode) {
        el = el.querySelector('input') || el;
        let iscancel = false;
        const inputEvent = e => {
            if (iscancel) {
                return false;
            }
            let value = e.target.value;

            if (el.querySelector('input')) {
                value = value.replace(/\D/gi, '');
                vnode.data.model.callback(value);
            } else {
                el.value = value.replace(/\D/gi, '');
                e.target.dispatchEvent(new Event('input'));
            }
        };
        el.onkeyup = inputEvent;
        //解决输入中文的问题
        el.addEventListener('compositionstart', e => {
            iscancel = true;
        });
        el.addEventListener('compositionend', e => {
            iscancel = false;
            inputEvent(e);
        });
    }
};
