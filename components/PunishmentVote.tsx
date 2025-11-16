'use client'

interface Punishment {
  id: string
  description: string
  type: string
  votes: number
  isCompleted: boolean
  assignedBy?: {
    username: string
  } | null
}

interface PunishmentVoteProps {
  punishments: Punishment[]
  onSuggest: (description: string, type: string) => void
  onVote: (punishmentId: string) => void
}

const punishmentTypes = [
  { value: 'NICKNAME', label: 'Funny Nickname' },
  { value: 'CHALLENGE', label: 'Challenge' },
  { value: 'VIDEO', label: 'Video Task' },
  { value: 'PHOTO', label: 'Photo Task' },
  { value: 'TASK', label: 'Task' },
  { value: 'OTHER', label: 'Other' },
]

/**
 * PunishmentVote component - suggests and votes on punishments
 */
export default function PunishmentVote({ punishments, onSuggest, onVote }: PunishmentVoteProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [description, setDescription] = useState('')
  const [type, setType] = useState('CHALLENGE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSuggest(description, type)
    setDescription('')
    setType('CHALLENGE')
    setIsAdding(false)
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Vote on Punishment</h3>

      {/* Existing Punishments */}
      <div className="space-y-3 mb-4">
        {punishments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <div className="text-3xl mb-2">🤔</div>
            <p className="text-sm">No punishment suggestions yet. Be the first!</p>
          </div>
        ) : (
          punishments.map((punishment) => (
            <div
              key={punishment.id}
              className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-danger transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    {punishment.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    Suggested by {punishment.assignedBy?.username || 'Anonymous'}
                  </p>
                </div>
                <button
                  onClick={() => onVote(punishment.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-danger to-warning text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <span>👍</span>
                  <span>{punishment.votes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Punishment */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-400 rounded-lg text-gray-600 font-semibold hover:border-danger hover:text-danger transition-all"
        >
          + Suggest a Punishment
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 border-2 border-danger">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Punishment Description
              </label>
              <textarea
                required
                minLength={5}
                maxLength={500}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the punishment..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-danger focus:outline-none resize-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-danger focus:outline-none text-sm"
              >
                {punishmentTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false)
                  setDescription('')
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-danger to-warning text-white rounded-lg font-semibold hover:shadow-lg text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
