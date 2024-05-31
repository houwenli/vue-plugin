import ImageUpload from './image-upload.vue';

ImageUpload.install = function(Vue) {
    Vue.component(ImageUpload.name, ImageUpload);
};

export default ImageUpload;
