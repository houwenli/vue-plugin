import baseMethods from '../../util/baseMethods';

export default {
    name: 'ws-drag',
    abstract: true,
    props: {
        vertical: {type: Boolean, default: false},
        dataList: {type: Array, default: () => []},
        dragStart: Function,
        dragEnd: Function,
    },
    data() {
        return {
            eventMap: new Map(),
            verticalOpts: {
                offset: 'offsetHeight',
                client: 'clientY',
                translate: 'translateY',
                startDirection: 'top',
                endDirection: 'bottom',
            },
            horizontalOpts: {
                offset: 'offsetWidth',
                client: 'clientX',
                translate: 'translateX',
                startDirection: 'left',
                endDirection: 'right',
            }
        }
    },
    computed: {
        opts() {
            return this.vertical ? this.verticalOpts : this.horizontalOpts;
        }
    },
    render(h) {
        const vnode = this.$slots.default ? this.$slots.default[0] : null;
        if (vnode && vnode.tag === 'ul' && vnode.children && vnode.children.length > 1) {
            vnode.key = this.getKey();
            this.removeEvent();
            this.eventMap.clear();
            for (let [index, node] of vnode.children.entries()) {
                this.$nextTick(() => this.eventMap.set(index, baseMethods.addHandler(node.elm, 'mousedown', this.cursorDown.bind(this, node, index))));
            }
        }
        return vnode;
    },
    methods: {
        cursorDown(node, index, e) {
            if (typeof this.dragStart === 'function' && this.dragStart(node, index, e) === false) {
                return;
            }
            this._dragTransfer = {
                el: node.elm,
                event: e,
                minTranslate: -(node.elm.getBoundingClientRect()[this.opts.startDirection] - this.$vnode.elm.getBoundingClientRect()[this.opts.startDirection]),
                maxTranslate: -(node.elm.getBoundingClientRect()[this.opts.endDirection] - this.$vnode.elm.getBoundingClientRect()[this.opts.endDirection]),
                client: e[this.opts.client],
                index: index,
                mouseMoveing: false,
                dragStartIndex: index,
                dragEndIndex: index
            }
            this._$dragElList = this.getDragElList();
            node.elm.style.transition = 'null';
            //核心计算偏移量
            this.calculateTranslate();
            this.startDrag();
        },
        startDrag() {
            this._cursorDown = true;
            baseMethods.addHandler(document, 'mousemove', this.mouseMoveDocumentHandler);
            baseMethods.addHandler(document, 'mouseup', this.mouseUpDocumentHandler);
            document.onselectstart = () => false;   //禁止页面选择和复制
        },
        mouseMoveDocumentHandler(e) {
            if (this._cursorDown === false) return;
            let translate = e[this.opts.client] - this._dragTransfer.client;
            if (translate <= this._dragTransfer.minTranslate || translate >= this._dragTransfer.maxTranslate) {
                return;
            }
            for (let [key, value] of this._translateMap.entries()) {
                if (translate >= key[0] && translate <= key[1]) {
                    this._$dragElList[value[0]].elm.style.transform = `${this.opts.translate}(${value[1]}px)`;
                    this._dragTransfer.dragEndIndex = value[1] ? value[0] : (translate > 0 ? value[0] - 1 : value[0] + 1);
                    break;
                }
            }
            this._dragTransfer.el.style.transform = `${this.opts.translate}(${translate}px)`;
        },
        mouseUpDocumentHandler(e) {
            this._cursorDown = false;
            document.onselectstart = null;
            baseMethods.removeHandler(document, 'mousemove', this.mouseMoveDocumentHandler);
            baseMethods.removeHandler(document, 'mouseup', this.mouseUpDocumentHandler);
            if (this._dragTransfer.event.clientX === e.clientX && this._dragTransfer.event.clientY === e.clientY) {
                this._dragTransfer.mouseMoveing = true;
                //e.stopImmediatePropagation();
                return;
            }
            if (this.dataList.length) {
                const transfer = this._dragTransfer;
                this.$emit('update:dataList', baseMethods.moveArray(this.dataList, transfer.index, transfer.dragEndIndex));
                this.$vnode.key = this.getKey();
            }
            typeof this.dragEnd === 'function' && this.dragEnd(this._dragTransfer, e);
        },
        //计算偏移量
        calculateTranslate() {
            this._translateMap = new Map();
            let radix = this._dragTransfer.minTranslate;
            let distance = 0;
            for (let [key, value] of this._$dragElList.entries()) {
                if (key === this._dragTransfer.index) {
                    value.elm.style.position = 'relative';
                    value.elm.style.zIndex = '10';
                    continue;
                }
                value.elm.style.transition = 'all 0.1s ease-in-out 0s';
                value.elm.style.position = 'relative';
                value.elm.style.zIndex = '1';
                let offset = value.elm[this.opts.offset];
                let _index = key - this._dragTransfer.index;
                let point = Math.round(offset / 2);
                let translate = this._$dragElList[this._dragTransfer.index]['elm'][this.opts.offset];
                distance += offset;
                _index > 0 && (translate *= -1);
                //key: [0] - [1] => 鼠标移动范围 ，value: [0] => 鼠标移动位置的index，[1] => 偏移值
                this._translateMap.set([radix, radix + point], [key, _index > 0 ? 0 : translate]);
                this._translateMap.set([radix + point + 1, this._dragTransfer.minTranslate + distance], [key, _index > 0 ? translate : 0]);
                radix += offset + 1;
            }
        },
        getDragElList() {
            const vnode = this.$slots.default ? this.$slots.default[0] : null;
            return vnode && vnode.children;
        },
        getKey() {
            return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
        },
        removeEvent() {
            this.eventMap.forEach(event => event());
        }
    },
    destroyed() {
        this.removeEvent();
    }
}
