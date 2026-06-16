/**
 * pages/auth/RegisterPage.tsx - 注册 [P1]
 * English Fun Zone
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password.length < 6) {
      setError('密码至少6个字符');
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, nickname);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('注册成功！请查看邮箱验证链接。');
    }
  };

  return (
    <div className="max-w-sm mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-2xl font-bold text-gray-800">注册</h1>
        <p className="text-gray-500 text-sm mt-1">创建你的 English Fun Zone 账号</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">昵称（可选）</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="input-field"
            placeholder="你的昵称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-field"
            placeholder="至少6个字符"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? '注册中...' : '注册'}
        </button>

        <p className="text-center text-sm text-gray-500">
          已有账号？{' '}
          <Link to="/auth/login" className="text-primary-600 font-medium hover:underline">
            登录
          </Link>
        </p>
      </form>
    </div>
  );
}
