const throwError = (message?: string): void => {
  const errorMessage = message || 'Error ocurred.';
  console.error(`[error] ${errorMessage}`);
  throw new Error(errorMessage);
};

const Mutation = {
  async createProject(parent, { data }, { prisma }, info) {
    console.info('[info] Mutation: createProject');
    return await prisma.mutation.createProject({ data }, info);
  },
  async createLiteralTranslation(parent, { data }, { prisma }, info) {
    console.info('[info] Mutation: createTranslation');

    const literal: string = data.literal.create.literal;
    const projectName: string = data.project.connect.name;
    const existsLiteral: boolean = await prisma.exists.Literal({
      literal,
      project: { name: projectName },
    });

    if (existsLiteral) throwError('The literal already exists.');

    return await prisma.mutation.createTranslation({ data }, info);
  },
  async upsertTranslation(parent, { where, create, update }, { prisma }, info) {
    console.info('[info] Mutation: upsertTranslation');

    const translationExists: boolean = await prisma.exists.Translation(where);
    if (!translationExists) {
      const languageId: string = create.language.connect.id;
      const literalId: string = create.literal.connect.id;
      const projectName: string = create.project.connect.name;

      const languageExists: boolean = await prisma.exists.Language({
        id: languageId,
      });
      const literalExists: boolean = await prisma.exists.Literal({
        id: literalId,
        project: { name: projectName },
      });
      const projectExists: boolean = await prisma.exists.Project({
        name: projectName,
      });

      if (!languageExists || !literalExists || !projectExists)
        throwError("It can't connect with the requiered elements.");
    }
    return await prisma.mutation.upsertTranslation(
      { where, create, update },
      info,
    );
  },
};

export { Mutation as default };