//https://zxcvbn-ts.github.io/zxcvbn/guide/getting-started/#output

// all package will be available under zxcvbnts
// getting the password strength
const options = {
  translations: zxcvbnts["language-en"].translations,
  graphs: zxcvbnts["language-common"].adjacencyGraphs,
  dictionary: {
    ...zxcvbnts["language-common"].dictionary,
    ...zxcvbnts["language-en"].dictionary,
  },
};
zxcvbnts.core.zxcvbnOptions.setOptions(options);

module.exports = function (password) {
  return zxcvbnts.core.zxcvbn(password);
};
