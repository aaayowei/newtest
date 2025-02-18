<template>
  <div class="rich-text-editor">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden;"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { ref, shallowRef, onBeforeUnmount, watch } from 'vue';

export default {
  name: 'RichTextEditor',
  components: { Editor, Toolbar },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'default'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef();

    // 内容 HTML
    const valueHtml = ref('');

    // 监听 props.modelValue 变化
    watch(
      () => props.modelValue,
      (val) => {
        valueHtml.value = val;
      },
      { immediate: true }
    );

    // 工具栏配置
    const toolbarConfig = {
      excludeKeys: [
        'insertTable',
        'codeBlock',
        'todo',
        'uploadVideo'
      ]
    };

    // 编辑器配置
    const editorConfig = {
      placeholder: '请输入内容...',
      defaultContent: '<p style="text-align: left;"></p>',
      MENU_CONF: {
        uploadImage: {
          server: `${process.env.VUE_APP_API_URL}/articles/upload/image`,
          fieldName: 'image',
          headers: {
            'x-access-token': localStorage.getItem('token')
          },
          maxFileSize: 5 * 1024 * 1024,
          customInsert(res, insertFn) {
            // 构建完整的图片URL
            const url = `${process.env.VUE_APP_API_URL}${res.url}`;
            // 直接使用 insertFn 插入图片，让编辑器处理 HTML
            insertFn(url, '', {
              style: {
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '10px auto'
              }
            });
          },
          onBeforeUpload(file) {
            console.log('Uploading file:', file);
            return file;
          },
          onSuccess(file, res) {
            console.log('Image upload success:', res);
            return res.url;
          },
          onFailed(file, res) {
            console.error('Image upload failed:', res);
            return null;
          },
          onError(file, err) {
            console.error('Image upload error:', err);
            return null;
          }
        }
      }
    };

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value;
      if (editor == null) return;
      editor.destroy();
    });

    const handleCreated = (editor) => {
      editorRef.value = editor;
    };

    const handleChange = (editor) => {
      emit('update:modelValue', editor.getHtml());
    };

    return {
      editorRef,
      valueHtml,
      toolbarConfig,
      editorConfig,
      handleCreated,
      handleChange
    };
  }
};
</script>

<style>
.rich-text-editor {
  border: 1px solid #ccc;
  z-index: 100;
}

/* 设置编辑器内容区域的默认对齐方式 */
.w-e-text-container {
  text-align: left !important;
}

/* 设置编辑器内容区域的图片样式 */
.w-e-text-container img,
.w-e-text img {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 10px auto !important;
  box-sizing: border-box !important;
}

/* 确保段落默认左对齐 */
.w-e-text p {
  text-align: left !important;
}

/* 编辑器内容区域的默认样式 */
.w-e-text {
  text-align: left !important;
}

/* 添加图片容器样式 */
.w-e-text [data-w-e-type="image"] {
  max-width: 100% !important;
  box-sizing: border-box !important;
  margin: 0 auto !important;
}
</style> 