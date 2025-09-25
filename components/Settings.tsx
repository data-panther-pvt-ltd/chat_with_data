'use client';

import { useEffect, useState } from 'react';
import { useApiKey } from './ApiKeyContext';
import { FASTAPI_BASE_URL } from '@/constants/constant';

const expirationOptions = ['30min', '1hr', '8hrs', '24hrs', 'lifetime'];

export default function Settings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { apiKey, setApiKey, clearApiKey } = useApiKey();
  const [expiration, setExpiration] = useState('30min');
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || FASTAPI_BASE_URL;

  useEffect(() => {
      // No server roundtrip; rely on local context/localStorage per requirements
      // Keep hook to update UI when modal opens
      if (!isModalOpen) return;
  }, [isModalOpen, apiBase]);

  const handleUpdate = async () => {
    try {
      setIsModalOpen(false);
    } catch (e) {
      // optional: surface error
    }
  };

  const handleClear = async () => {
    try {
      clearApiKey();
    } catch (e) {
      // optional: surface error
    }
  };

  return (
    <div>
      <button
        className="px-27 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        onClick={() => setIsModalOpen(true)}
      >
        Settings
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">API Key Settings</h2>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Enter OpenAI API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleUpdate}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Update
              </button>
              <button
                onClick={handleClear}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Clear
              </button>
            </div>

            {/* Expiration Dropdown */}
            <div className="flex items-center gap-2">
              <span>The key would be expired in</span>
              <select
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              >
                {expirationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Close Modal */}
            <div className="text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

