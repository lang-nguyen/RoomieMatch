import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const HistoryGroup = ({ title, users, defaultOpen = false, onSelectUser }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`matching-history-group ${isOpen ? 'is-open' : ''}`}>
      <button type="button" onClick={() => setIsOpen((open) => !open)}>
        <span>{title}</span>
        <ChevronDown size={16} />
      </button>

      <div className="matching-history-list">
        {users.length > 0 ? (
          users.map((user) => {
            const HistoryItem = onSelectUser ? 'button' : 'div';

            return (
              <HistoryItem
                className={`matching-history-user ${onSelectUser ? 'is-clickable' : ''}`}
                key={user.id}
                type={onSelectUser ? 'button' : undefined}
                onClick={() => onSelectUser?.(user)}
              >
                <img src={user.avatar} alt={user.name} />
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.area}</small>
                </span>
              </HistoryItem>
            );
          })
        ) : (
          <p>Chưa có dữ liệu</p>
        )}
      </div>
    </div>
  );
};

const MatchHistoryPanel = ({ matchHistory, skippedUsers, onSelectMatch }) => {
  return (
    <aside className="matching-history-panel">
      <h1>Lịch sử ghép bạn</h1>
      <HistoryGroup title="Lịch sử Match" users={matchHistory} onSelectUser={onSelectMatch} />
      <HistoryGroup title="Đã bỏ qua" users={skippedUsers} />
    </aside>
  );
};

export default MatchHistoryPanel;
