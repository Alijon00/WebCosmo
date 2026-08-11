import React from "react";
import "./button.css";

interface ButtonProps {
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "huge" | "average" ;
  color?: "primary" | "secondary" | "tertiary";
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "medium",
  color = "primary",
  onClick,
}) => {
  const className = `btn ${size} ${color}`;
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
