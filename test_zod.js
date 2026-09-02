const { z } = require('zod');

const ArticleVocabularySchema = z.object({
 word: z.string().min(1),
});

const ArticleSchema = z.object({
 title: z.string().min(3),
 vocabulary: z.array(ArticleVocabularySchema),
});

const res1 = ArticleSchema.safeParse("SCIENCE");
console.log("Root string:", JSON.stringify(res1.error?.format()));

const res2 = ArticleSchema.safeParse({ title: "abc", vocabulary: ["SCIENCE"] });
console.log("Vocab string:", JSON.stringify(res2.error?.format()));
