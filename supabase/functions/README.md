# Supabase Edge Functions

## Gợi ý KHBD bằng OpenRouter

Deploy function:

```powershell
supabase functions deploy generate-lesson-plan
```

Set secrets trong Supabase Dashboard hoặc CLI:

```powershell
supabase secrets set OPENROUTER_API_KEY=your-key OPENROUTER_MODEL=openai/gpt-4o-mini
```

`OPENROUTER_API_KEY` không được đặt trong `.env.local` hoặc frontend. Function yêu cầu người dùng đăng nhập bằng Supabase Auth trước khi gọi OpenRouter.
