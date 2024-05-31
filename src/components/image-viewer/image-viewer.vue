<template>
    <transition name="scale">
        <div class="el-image-viewer__wrapper" v-if="visible" :style="{ 'z-index': zIndex }">
            <div class="el-image-viewer__mask"></div>
            <!-- CLOSE -->
            <span class="el-image-viewer__btn el-image-viewer__close" @click="hide"><i class="el-icon-circle-close"></i></span>
            <!-- ARROW -->
            <template v-if="!isSingle">
                    <span class="el-image-viewer__btn el-image-viewer__prev" :class="{ 'is-disabled': !infinite && isFirst }" @click="prev">
                        <i class="el-icon-arrow-left"/>
                    </span>
                <span class="el-image-viewer__btn el-image-viewer__next" :class="{ 'is-disabled': !infinite && isLast }" @click="next">
                        <i class="el-icon-arrow-right"/>
                    </span>
            </template>
            <!-- ACTIONS -->
            <div class="el-image-viewer__btn el-image-viewer__actions">
                <div class="el-image-viewer__actions__inner">
                    <i class="el-icon-zoom-out" @click="handleActions('zoomOut')"></i>
                    <i class="el-icon-zoom-in" @click="handleActions('zoomIn')"></i>
                    <i class="el-icon-c-scale-to-original" @click="reset"></i>
                    <i class="el-icon-refresh-left" @click="handleActions('anticlocelise')"></i>
                    <i class="el-icon-refresh-right" @click="handleActions('clocelise')"></i>
                    <i class="iconfont icon-shangxia" @click="handleActions('scaleY')"></i>
                    <i class="iconfont icon-zuoyou" @click="handleActions('scaleX')"></i>
                </div>
            </div>
            <!-- CANVAS -->
            <div class="el-image-viewer__canvas">
                <img
                    v-for="(url, i) in urlList"
                    v-if="i === index"
                    ref="img"
                    class="el-image-viewer__img"
                    :key="i"
                    :src="currentImg"
                    :style="imgStyle"
                    @load="handleImgLoad"
                    @error="handleImgError"
                    @mousedown="handleMouseDown">
            </div>
        </div>
    </transition>
</template>

<script>

    import baseMethods from '../../util/baseMethods'
    const mousewheelEventName = window.navigator.userAgent.match(/firefox/i) ? 'DOMMouseScroll' : 'mousewheel';

    export default {
        name: 'ws-image-viewer',

        props: {
            visible: {type: Boolean, default: false},
            srcList: {type: Array, default: () => []},
            currentIndex: {type: Number, default: 0},
            zIndex: {type: Number, default: 2000},
            onSwitch: {
                type: Function, default: () => {
                }
            },
            onClose: {
                type: Function, default: () => {
                }
            }
        },

        data() {
            return {
                index: 0,
                urlList: [],
                isShow: false,
                infinite: true,
                loading: false,
                transform: {
                    scale: 1,
                    deg: 0,
                    scaleX: 1,
                    scaleY: 1,
                    offsetX: 0,
                    offsetY: 0,
                    enableTransition: false
                }
            };
        },
        computed: {
            isSingle() {
                return this.urlList.length <= 1;
            },
            isFirst() {
                return this.index === 0;
            },
            isLast() {
                return this.index === this.urlList.length - 1;
            },
            currentImg() {
                return this.urlList[this.index];
            },
            imgStyle() {
                const {scale, deg, scaleX, scaleY, offsetX, offsetY, enableTransition} = this.transform;
                const style = {
                    transform: `scale(${scale > 0.1 ? scale : 0.1}) rotate(${deg}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
                    transition: enableTransition ? 'transform .3s' : '',
                    'margin-left': `${offsetX * 2}px`,
                    'margin-top': `${offsetY * 2}px`,
                    'max-width':'100%',
                    'max-height':'100%'
                };
                return style;
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        baseMethods.disableBodyScroll();
                        this.deviceSupportInstall();
                    } else {
                        this.index=this.currentIndex
                        baseMethods.enableBodyScroll();
                    }
                },
                immediate: true
            },
            srcList: {
                handler: function (val) {
                    this.urlList = [...val];
                },
                immediate: true
            },
            index: {
                handler: function (val) {
                    this.reset();
                    this.onSwitch(val);
                }
            },
            currentIndex: {
                handler: function (val) {
                    if (val <= this.urlList.length) {
                        this.index = val;
                    }
                },
                immediate: true
            },
            currentImg(val) {
                this.$nextTick(_ => {
                    const $img = this.$refs.img || [];
                    if ($img[0] && !$img[0].complete) {
                        this.loading = true;
                    }
                });
            }
        },
        methods: {
            hide() {
                this.$emit('update:visible', false);
                this.reset()
                this.deviceSupportUninstall();
                this.onClose();
            },
            deviceSupportInstall() {
                this._keyDownHandler = this.rafThrottle(e => {
                    const keyCode = e.keyCode;
                    switch (keyCode) {
                        case 27:    // ESC
                            this.hide();
                            break;
                        case 32:    // SPACE
                            this.reset();
                            break;
                        case 37:    // LEFT_ARROW
                            this.prev();
                            break;
                        case 38:    // UP_ARROW
                            this.handleActions('zoomIn');
                            break;
                        case 39:    // RIGHT_ARROW
                            this.next();
                            break;
                        case 40:    // DOWN_ARROW
                            this.handleActions('zoomOut');
                            break;
                    }
                });
                this._mouseWheelHandler = this.rafThrottle(e => {
                    const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
                    if (delta > 0) {
                        this.handleActions('zoomIn', {
                            zoomRate: 0.15,
                            enableTransition: false
                        });
                    } else {
                        this.handleActions('zoomOut', {
                            zoomRate: 0.15,
                            enableTransition: false
                        });
                    }
                });
                baseMethods.addHandler(document, 'keydown', this._keyDownHandler);
                baseMethods.addHandler(document, mousewheelEventName, this._mouseWheelHandler);
            },
            deviceSupportUninstall() {
                baseMethods.removeHandler(document, 'keydown', this._keyDownHandler);
                baseMethods.removeHandler(document, mousewheelEventName, this._mouseWheelHandler);
                this._keyDownHandler = null;
                this._mouseWheelHandler = null;
            },
            handleImgLoad(e) {
                this.loading = false;
            },
            handleImgError(e) {
                this.loading = false;
                e.target.alt = '加载失败';
            },
            handleMouseDown(e) {
                if (this.loading || e.button !== 0) return;

                const {offsetX, offsetY} = this.transform;
                const startX = e.pageX;
                const startY = e.pageY;
                this._dragHandler = this.rafThrottle(ev => {
                    this.transform.offsetX = offsetX + ev.pageX - startX;
                    this.transform.offsetY = offsetY + ev.pageY - startY;
                });
                baseMethods.addHandler(document, 'mousemove', this._dragHandler);
                baseMethods.addHandler(document, 'mouseup', ev => {
                    baseMethods.removeHandler(document, 'mousemove', this._dragHandler);
                });

                e.preventDefault();
            },
            reset() {
                this.transform = {
                    scale: 1,
                    deg: 0,
                    scaleX: 1,
                    scaleY: 1,
                    offsetX: 0,
                    offsetY: 0,
                    enableTransition: false
                };
            },
            prev() {
                if (this.isFirst && !this.infinite) return;
                const len = this.urlList.length;
                this.index = (this.index - 1 + len) % len;
            },
            next() {
                if (this.isLast && !this.infinite) return;
                const len = this.urlList.length;
                this.index = (this.index + 1) % len;
            },
            handleActions(action, options = {}) {
                if (this.loading) return;
                const {zoomRate, rotateDeg, enableTransition} = {
                    zoomRate: 1,
                    rotateDeg: 90,
                    enableTransition: true,
                    ...options
                };
                const {transform} = this;
                switch (action) {
                    case 'zoomOut':
                        if (transform.scale > 0.2) {
                            transform.scale = parseFloat((transform.scale - zoomRate).toFixed(3));
                        }
                        break;
                    case 'zoomIn':
                        transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
                        break;
                    case 'clocelise':
                        transform.deg += rotateDeg;
                        break;
                    case 'anticlocelise':
                        transform.deg -= rotateDeg;
                        break;
                    case 'scaleX':
                        transform.scaleX = transform.scaleX == 1 ? -1 : 1;
                        break;
                    case 'scaleY':
                        transform.scaleY = transform.scaleY == 1 ? -1 : 1;
                        break;

                }
                transform.enableTransition = enableTransition;
            },
            rafThrottle(fn) {
                let locked = false;
                return function (...args) {
                    if (locked) return;
                    locked = true;
                    window.requestAnimationFrame(_ => {
                        fn.apply(this, args);
                        locked = false;
                    });
                };
            },
        },

    };
</script>

<style lang="scss">
    .el-image-viewer__btn {
        opacity: 1;
        color: #fff;
    }

    .el-image-viewer__img {
        cursor: grab;
    }

    .el-image-viewer__actions {
        cursor: auto !important;

        i {
            cursor: pointer !important;
        }
    }
</style>
