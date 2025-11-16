'use client'

interface Friend {
  id: string
  username: string
  avatar?: string | null
  points?: number
}

interface FriendsListProps {
  friends: Friend[]
  onSelectFriend?: (friendId: string) => void
}

/**
 * FriendsList component - displays a list of friends
 */
export default function FriendsList({ friends, onSelectFriend }: FriendsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        Friends
        <span className="text-sm text-gray-500">({friends.length})</span>
      </h3>

      {friends.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">😔</div>
          <p className="text-sm">No friends yet. Add some friends to start betting!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => onSelectFriend?.(friend.id)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200
                ${onSelectFriend ? 'hover:border-primary cursor-pointer' : ''}
                transition-all
              `}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                {friend.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{friend.username}</p>
                {friend.points !== undefined && (
                  <p className="text-xs text-gray-500">{friend.points} points</p>
                )}
              </div>
              {onSelectFriend && (
                <div className="text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
