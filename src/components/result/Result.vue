<template>
    <div :class="[prefix, prefix + '__' + status]">
        <div :class="[prefix + '__icon', 'is-' + status]">
            <slot name="icon">
                <i v-if="isNaN(status)" :class="'el-icon-' + status"></i>
                <img
                    v-else
                    :src="require(`./../../assets/images/${status}.svg`)"
                    alt=""
                />
            </slot>
        </div>
        <div :class="prefix + '__title'">
            <slot name="title">{{ title }}</slot>
        </div>
        <div :class="prefix + '__subTitle'">
            <slot name="subTitle">{{ subTitle }}</slot>
        </div>
        <div :class="prefix + '__action'"><slot name="action"></slot></div>
    </div>
</template>

<script>
export default {
    name: "ws-result",
    props: {
        title: { type: String, default: "" },
        subTitle: { type: String, default: "" },
        status: {
            type: String,
            default: "success",
            validator: value =>
                [
                    "success",
                    "info",
                    "warning",
                    "error",
                    "403",
                    "404",
                    "500"
                ].includes(value)
        },
        icon: { type: String, default: "" }
    },

    data() {
        return {
            prefix: "ws-result"
        };
    }
};
</script>

<style lang="scss" scoped>
.ws-result {
    padding: 48px 32px;
    &__icon {
        font-size: 72px;
        text-align: center;
    }
    &__title {
        color: #333;
        font-size: 24px;
        line-height: 1.8;
        text-align: center;
    }
    &__subTitle {
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        text-align: center;
    }
    &__action {
        margin-top: 32px;
        text-align: center;
        .el-button {
            min-width: 100px;
        }
    }
    .is-success {
        color: #52c41a;
    }
    .is-info {
        color: #409eff;
    }
    .is-error {
        color: #f56c6c;
    }
    .is-warning {
        color: #e6a23c;
    }
}
</style>
