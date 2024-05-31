import ImageViewer from './image-viewer.vue';

ImageViewer.install = function(Vue) {
    Vue.component(ImageViewer.name, ImageViewer);
};

export default ImageViewer;
