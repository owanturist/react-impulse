import { z } from "zod"

export const frontmatterSchema = z
  .union([
    z.object({
      type: z.literal("feature"),
      "test-plan": z.union([z.string().nonempty(), z.record(z.unknown())]),
    }),

    z.object({
      type: z.literal("bugfix"),
      "acceptance-criteria": z.array(z.string().nonempty()).nonempty(),
      "relates-to": z.array(z.string().nonempty()).nonempty(),
    }),

    z.object({
      type: z.literal("test-spec"),
      "relates-to": z.array(z.string().nonempty()).nonempty(),
    }),

    z.object({
      type: z.literal("implementation-brief"),
      "acceptance-criteria": z.array(z.string().nonempty()).nonempty(),
    }),

    z.object({
      type: z.enum(["concept", "decision", "doc-snippet"]),
    }),
  ])
  .and(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      title: z.string().nonempty(),
      packages: z
        .array(z.enum(["react-impulse", "react-impulse-form"]))
        .min(1)
        .refine((arr) => new Set(arr).size === arr.length, {
          message: "packages must be unique",
        }),
      status: z.enum(["proposed", "accepted", "implemented", "deprecated"]),
      versions: z
        .union([z.string().nonempty(), z.array(z.string().nonempty())])
        .default([]),
      owner: z.string().nonempty(),
      "last-reviewed": z.coerce.date(),
      tags: z.array(z.string().nonempty()).default([]),
      diataxis: z.enum(["reference", "how-to", "tutorial", "explanation"]),
      "api-changes": z.string().optional(),
      migration: z.string().optional(),
      references: z.array(z.string().nonempty()).default([]),
      "acceptance-criteria": z.array(z.string().nonempty()).default([]),
      "relates-to": z.array(z.string().nonempty()).default([]),
      "test-plan": z
        .union([z.string().nonempty(), z.record(z.unknown())])
        .optional(),
    }),
  )
