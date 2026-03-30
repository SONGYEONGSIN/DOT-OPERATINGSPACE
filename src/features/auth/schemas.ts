import { z } from "zod";

const ALLOWED_DOMAIN = "jinhakapply.com";

function emailDomainCheck(email: string) {
  const domain = email.split("@")[1];
  return domain === ALLOWED_DOMAIN;
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해 주세요")
    .email("올바른 이메일 형식이 아닙니다")
    .refine(emailDomainCheck, `@${ALLOWED_DOMAIN} 이메일만 사용 가능합니다`),
  password: z
    .string()
    .min(1, "비밀번호를 입력해 주세요")
    .min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "이름을 입력해 주세요")
      .min(2, "이름은 2자 이상이어야 합니다"),
    email: z
      .string()
      .min(1, "이메일을 입력해 주세요")
      .email("올바른 이메일 형식이 아닙니다")
      .refine(emailDomainCheck, `@${ALLOWED_DOMAIN} 이메일만 사용 가능합니다`),
    password: z
      .string()
      .min(1, "비밀번호를 입력해 주세요")
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .regex(/[a-z]/, "영문 소문자를 포함해야 합니다")
      .regex(/[A-Z]/, "영문 대문자를 포함해야 합니다")
      .regex(/[0-9]/, "숫자를 포함해야 합니다")
      .regex(/[^a-zA-Z0-9]/, "특수문자를 포함해야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해 주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해 주세요")
    .email("올바른 이메일 형식이 아닙니다")
    .refine(emailDomainCheck, `@${ALLOWED_DOMAIN} 이메일만 사용 가능합니다`),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "새 비밀번호를 입력해 주세요")
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .regex(/[a-z]/, "영문 소문자를 포함해야 합니다")
      .regex(/[A-Z]/, "영문 대문자를 포함해야 합니다")
      .regex(/[0-9]/, "숫자를 포함해야 합니다")
      .regex(/[^a-zA-Z0-9]/, "특수문자를 포함해야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해 주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
