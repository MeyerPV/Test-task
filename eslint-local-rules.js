const isReportable = comment => comment.type !== 'Shebang';

module.exports = {
  'no-comments': {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Disallow every comment, including lint, TypeScript and triple-slash directives',
      },
      schema: [],
      messages: {
        noComments:
          'Comments are not allowed. Put the intent into names, small functions or docs/ai/guidelines.',
      },
    },
    create: context => {
      const sourceCode = context.sourceCode ?? context.getSourceCode();

      return {
        Program: () => {
          sourceCode
            .getAllComments()
            .filter(isReportable)
            .forEach(comment => {
              context.report({ loc: comment.loc, messageId: 'noComments' });
            });
        },
      };
    },
  },
};
