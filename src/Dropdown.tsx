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
      className="p-2 border border-gray-300 rounded"
    >
      <option value="" disabled>
        Select a username
      </option>
      {usernames.map(username => (
        <option key={username} value={username}>
          {username}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
