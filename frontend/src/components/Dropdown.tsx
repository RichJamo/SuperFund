import React from "react";

interface DropdownProps {
  usernames: string[];
  selectedUsername: string;
  onSelect: (username: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  usernames,
  selectedUsername,
  onSelect
}) => {
  return (
    <select
      value={selectedUsername}
      onChange={e => onSelect(e.target.value)}
      className="bg-gray-800 text-white border border-gray-700 p-2 rounded"
    >
      <option value="" disabled>
        {usernames.length === 0 ? "No clients available" : "Select a username"}
      </option>
      {usernames.length > 0
        ? usernames.map(username => (
            <option key={username} value={username}>
              {username}
            </option>
          ))
        : null}
    </select>
  );
};

export default Dropdown;
