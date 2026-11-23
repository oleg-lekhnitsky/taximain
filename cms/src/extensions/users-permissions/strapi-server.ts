// Website accounts are unused; keep the collection out of the content editor.
// This does not affect Strapi administrator accounts.
export default (plugin: { contentTypes: { user: { schema: { pluginOptions?: Record<string, Record<string, unknown>> } } } }) => {
  const schema = plugin.contentTypes.user.schema;
  schema.pluginOptions = {
    ...schema.pluginOptions,
    "content-manager": {
      ...schema.pluginOptions?.["content-manager"],
      visible: false,
    },
  };
  return plugin;
};
