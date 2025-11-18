'use client'

import { useState } from 'react'

interface CreateBetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (betData: BetFormData) => void
}

export interface BetFormData {
  title: string
  description: string
  deadline: string
  category: string
  proofRequired: string
}

const categories = [
  { value: 'FITNESS', label: 'Fitness' },
  { value: 'STUDY', label: 'Study' },
  { value: 'GAMING', label: 'Gaming' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'WORK', label: 'Work' },
  { value: 'FOOD', label: 'Food' },
  { value: 'CHALLENGE', label: 'Challenge' },
  { value: 'OTHER', label: 'Other' },
]

const proofTypes = [
  { value: 'NONE', label: 'No Proof Required' },
  { value: 'TEXT', label: 'Text Description' },
  { value: 'IMAGE', label: 'Photo Proof' },
  { value: 'VIDEO', label: 'Video Proof' },
]

/**
 * CreateBetModal component - modal for creating a new bet
 */
export default function CreateBetModal({ isOpen, onClose, onSubmit }: CreateBetModalProps) {
  const [formData, setFormData] = useState<BetFormData>({
    title: '',
    description: '',
    deadline: '',
    category: 'CHALLENGE',
    proofRequired: 'NONE',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      title: '',
      description: '',
      deadline: '',
      category: 'CHALLENGE',
      proofRequired: 'NONE',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="glass-effect border-2 border-gray-700 rounded-2xl shadow-neon max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-gold-500 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Create New Bet</h2>
          <p className="text-white text-opacity-90 text-sm mt-1">
            Challenge your friends and prove yourself!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Bet Title *
            </label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., I'll run 10km this week"
              className="w-full px-4 py-3 bg-dark-700 border-2 border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none text-white placeholder-gray-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description *
            </label>
            <textarea
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your bet in detail..."
              className="w-full px-4 py-3 bg-dark-700 border-2 border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none resize-none text-white placeholder-gray-500"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`
                    px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all transform hover:scale-105
                    ${
                      formData.category === cat.value
                        ? 'border-gold-500 bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 shadow-gold'
                        : 'border-gray-600 bg-dark-700 text-gray-300 hover:border-gold-500'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Deadline *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border-2 border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none text-white"
            />
          </div>

          {/* Proof Required */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Proof Required
            </label>
            <select
              value={formData.proofRequired}
              onChange={(e) => setFormData({ ...formData, proofRequired: e.target.value })}
              className="w-full px-4 py-3 bg-dark-700 border-2 border-gray-600 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500 focus:outline-none text-white"
            >
              {proofTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 glass-effect border-2 border-gray-600 rounded-lg font-semibold text-white hover:border-gray-500 transition-all transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-gold-500 text-white rounded-lg font-semibold shadow-neon hover:shadow-neon-blue transition-all transform hover:scale-105"
            >
              Create Bet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
