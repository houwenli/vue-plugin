<template>
    <el-form :inline="inline" :model="form" ref="form" label-width="100px">
        <!-- 表单原子组件属性和方法太多，后面做优化 -->
        <el-form-item
            v-for="formItem in formLabel"
            :key="formItem.prop"
            :label="formItem.label"
            :prop="formItem.prop"
            :rules="
                formItem.rule || formItem.required
                    ? $rules({
                          required: true,
                          message:
                              computedMessage(formItem.type) + formItem.label,
                          rule: formItem.rule
                      })
                    : null
            "
        >
            <!-- input输入框 -->
            <el-input
                v-if="
                    ['input', 'number', 'password', 'textarea'].includes(
                        formItem.type
                    )
                "
                v-model="form[formItem.prop]"
                :type="formItem.type === 'input' ? 'input' : formItem.type"
                :placeholder="formItem.placeholder || '请输入' + formItem.label"
                :clearable="formItem.clearable || true"
                :disabled="formItem.disabled"
                :maxlength="formItem.maxlength"
                :minlength="formItem.minlength"
                :show-word-limit="formItem.showWordLimit"
                :size="formItem.size"
                :autocomplete="formItem.autocomplete || 'off'"
                :style="{ width: formItem.width + 'px' }"
                :max="formItem.max"
                :min="formItem.min"
                :autoSize="formItem.autoSize"
                :rows="formItem.rows || 2"
                @change="val => inputChange(val, formItem.prop)"
            ></el-input>
            <!-- select下拉框 -->
            <el-select
                v-if="formItem.type === 'select'"
                v-model="form[formItem.prop]"
                :placeholder="formItem.placeholder || '请选择' + formItem.label"
                :clearable="formItem.clearable || true"
                :disabled="formItem.disabled"
                :size="formItem.size"
                :multiple="formItem.multiple"
                :filterable="formItem.filterable"
                :style="{ width: formItem.width + 'px' }"
                @change="val => selectChange(val, formItem.prop)"
            >
                <el-option
                    v-for="item in formItem.data"
                    :key="item.value || item[formItem.defaultValue]"
                    :label="item.label || item[formItem.defaultLabel]"
                    :value="item.value || item[formItem.defaultValue]"
                >
                </el-option>
            </el-select>
            <!-- radio单选框 -->
            <el-radio-group
                v-if="formItem.type === 'radio'"
                v-model="form[formItem.prop]"
                :disabled="formItem.disabled || false"
                :size="formItem.size"
                :text-color="formItem.textColor || '#ffffff'"
                :fill="formItem.fill || '#409EFF'"
                :style="{ width: formItem.width + 'px' }"
                @change="val => radioChange(val, formItem.prop)"
            >
                <el-radio
                    v-for="(item, index) in formItem.data"
                    :key="index"
                    :label="item.label || item[formItem.defaultLabel]"
                    :value="item.value || item[formItem.defaultValue]"
                    :disabled="item.disabled || false"
                    :border="item.border || false"
                    :size="item.size"
                    >{{ item.name || item.label }}</el-radio
                >
            </el-radio-group>

            <!-- checkbox多选框 -->
            <el-checkbox-group
                v-if="formItem.type === 'checkbox'"
                v-model="form[formItem.prop]"
                :disabled="formItem.disabled || false"
                :size="formItem.size"
                @change="val => checkboxChange(val, formItem.prop)"
            >
                <el-checkbox
                    v-for="(item, index) in formItem.data"
                    :key="index"
                    :label="item.label"
                    :disabled="item.disabled || false"
                ></el-checkbox>
            </el-checkbox-group>

            <!-- switch开关 -->
            <el-switch
                v-if="formItem.type === 'switch'"
                v-model="form[formItem.prop]"
                :disabled="formItem.disabled || false"
                :size="formItem.size"
                :width="formItem.width"
                :active-color="formItem.activeColor"
                :inactive-color="formItem.inactiveColor"
                :active-value="formItem.activeValue"
                :inactive-value="formItem.inactiveValue"
                :active-text="formItem.activeText"
                :inactive-text="formItem.inactiveText"
                @change="val => switchChange(val, formItem.prop)"
            >
            </el-switch>

            <!-- inputNumber计数器 -->
            <el-input-number
                v-if="formItem.type === 'inputNumber'"
                v-model="form[formItem.prop]"
                :label="formItem.label"
                :placeholder="formItem.placeholder || '请输入' + formItem.label"
                :disabled="formItem.disabled"
                :step="formItem.step"
                :min="formItem.min"
                :max="formItem.max"
                :step-strictly="formItem.stepStrictly"
                :precision="formItem.precision"
                :size="formItem.size"
                :controls-position="formItem.controlsPosition"
                :style="{ width: formItem.width + 'px' }"
                @change="val => inputNumberChange(val, formItem.prop)"
            ></el-input-number>

            <!-- date日期 -->
            <el-date-picker
                v-if="
                    [
                        'year',
                        'month',
                        'date',
                        'dates',
                        'week',
                        'datetime',
                        'datetimerange',
                        'daterange',
                        'monthrange'
                    ].includes(formItem.type)
                "
                v-model="form[formItem.prop]"
                :type="formItem.type"
                :placeholder="formItem.placeholder || '请选择' + formItem.label"
                :clearable="formItem.clearable || true"
                :disabled="formItem.disabled"
                :size="formItem.size"
                :picker-options="formItem.pickerOptions"
                :format="formItem.format"
                :unlink-panels="formItem.unlinkPanels"
                :range-separator="formItem.rangeSeparator || '至'"
                :start-placeholder="formItem.startPlaceholder || '开始日期'"
                :end-placeholder="formItem.endPlaceholder || '结束日期'"
                :default-value="formItem.defaultValue"
                :default-time="formItem.defaultTime"
                :value-format="
                    formItem.valueFormat || formItem.type.includes('datetime')
                        ? 'yyyy-MM-dd HH:mm:ss'
                        : 'yyyy-MM-dd' || 'yyyy-MM-dd'
                "
                @change="val => dateChange(val, formItem.prop)"
            ></el-date-picker>

            <!-- time时间 -->
            <el-time-picker
                v-if="formItem.type === 'time'"
                v-model="form[formItem.prop]"
                :type="formItem.type"
                :placeholder="formItem.placeholder || '请选择' + formItem.label"
                :clearable="formItem.clearable || true"
                :disabled="formItem.disabled"
                :size="formItem.size"
                :picker-options="formItem.pickerOptions"
                :format="formItem.format"
                :is-range="formItem.isRange"
                :arrow-control="formItem.arrowControl"
                :range-separator="formItem.rangeSeparator || '-'"
                :start-placeholder="formItem.startPlaceholder || '开始时间'"
                :end-placeholder="formItem.endPlaceholder || '结束时间'"
                :default-value="formItem.defaultValue"
                :value-format="formItem.valueFormat || 'HH:mm:ss'"
                @change="val => timeChange(val, formItem.prop)"
            ></el-time-picker>

            <!-- slider滑块 -->
            <el-slider
                v-if="formItem.type === 'slider'"
                v-model="form[formItem.prop]"
                :disabled="formItem.disabled"
                :min="formItem.min"
                :max="formItem.max"
                :show-tooltip="formItem.showTooltip"
                :format-tooltip="formItem.formatTooltip"
                :step="formItem.step"
                :show-stops="formItem.showStops"
                :show-input="formItem.showInput"
                :show-input-controls="formItem.showInputControls"
                :range="formItem.range"
                :vertical="formItem.vertical"
                :height="formItem.height + 'px'"
                :marks="formItem.marks"
                :debounce="formItem.debounce"
                @change="val => sliderChange(val, formItem.prop)"
            ></el-slider>

            <!-- color颜色选择器 -->
            <el-color-picker
                v-if="formItem.type === 'color'"
                v-model="form[formItem.prop]"
                :disabled="formItem.disabled"
                :size="formItem.size"
                :show-alpha="formItem.showAlpha"
                :predefine="
                    formItem.predefine || [
                        '#ff4500',
                        '#ff8c00',
                        '#ffd700',
                        '#90ee90',
                        '#00ced1',
                        '#1e90ff',
                        '#c71585',
                        'rgb(255, 120, 0)',
                        'hsv(51, 100, 98)',
                        'hsl(181, 100%, 37%)'
                    ]
                "
                :color-format="formItem.colorFormat"
                @change="val => colorChange(val, formItem.prop)"
            ></el-color-picker>
            <!-- 复杂的使用插槽 -->
            <div v-if="formItem.type === 'slot'">
                2121<slot :name="formItem.prop"></slot>
            </div>
        </el-form-item>
        <!--留一个插槽-->

        <el-form-item>
            <slot name="action">
                <el-button type="primary" @click="submitForm('form')"
                    >立即创建</el-button
                >
                <el-button @click="resetForm('form')">重置</el-button>
            </slot>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
    name: "ws-form",
    props: {
        inline: { type: Boolean, default: false },
        form: { type: Object, default: () => {} }, //表单绑定值集合
        formLabel: { type: Array, default: () => [] }, //表单项
        data: {
            type: Array,
            default: () => []
        },
        formConfig: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        config() {
            return Object.assign({}, this.formConfig);
        }
    },
    data() {
        return {};
    },
    methods: {
        // select改变时
        selectChange(val, prop) {
            this.$emit(`select${prop}`, val);
        },
        dateChange(val, prop) {
            this.$emit(`date${prop}`, val);
        },
        submitForm(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    this.$emit("submit", this.form);
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.$emit("reset");
        },
        computedMessage(type) {
            return ["input", "number", "password", "textarea"].includes(type)
                ? "请输入"
                : "请选择";
        }
    }
};
</script>

<style lang="scss" scoped></style>
