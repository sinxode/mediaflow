import React from 'react';
import { Search } from 'lucide-react';
import Input from '../Input/Input';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search tasks, assets...',
  className = '',
  ...props
}) => {
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      leftIcon={<Search />}
      className={className}
      {...props}
    />
  );
};

export default SearchBar;
