import { Check, X } from "lucide-react";
import React from "react";

// This component checks the criteria for password strength
const PasswordCriteria = ({ password = "", strength }) => {
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const getTextColor = (strength) => {
    if (strength === 0) return "text-danger1";
    if (strength === 1) return "text-warning1";
    if (strength === 2) return "text-warning1";
    if (strength === 3) return "text-info1";
    return "text-success1";
  };

  return (
    <div className="mt-2">
      {criteria.map((item) => (
        <div key={item.label} className="d-flex align-items-center text-small">
          {item.met ? (
            <Check className="text-success1 me-2" />
          ) : (
            <X className="text-secondary1 me-2" />
          )}
          <span className={item.met ? "text-success1" : "text-black-500"}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// This component shows the strength of the password visually
const PasswordStrengthMeter = ({ password = "" }) => {
  const getStrength = (pass) => {
    if (!pass) return 0; 

    let strength = 0;
    if (pass.length >= 8) strength++; 
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++; 
    if (pass.match(/[^a-zA-Z\d]/)) strength++; 
    return strength;
  };

  const strength = getStrength(password);

  const getColor = (strength) => {
    if (strength === 0) return 'bg-danger1'; 
    if (strength === 1) return 'bg-warning1'; 
    if (strength === 2) return 'bg-warning1'; 
    if (strength === 3) return 'bg-primary1'; 
    return 'bg-success1'; 
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getTextColor = (strength) => {
    if (strength === 0) return "text-danger1";
    if (strength === 1) return "text-warning1";
    if (strength === 2) return "text-warning1";
    if (strength === 3) return "text-primary1";
    return "text-success1";
  };

  return (
    <div className="mt-2" style={{fontSize: '14px'}}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className={`text-small ${getTextColor(strength)} text-white`}>Password Strength</span>
        <span className={`text-small ${getTextColor(strength)} `}>{getStrengthText(strength)}</span>
      </div>

      <div className="d-flex">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            style={{height: '3px'}}
            className={`h-1 flex-grow-1 rounded-2 me-1 ${index < strength ? getColor(strength) : 'bg-secondary1'}`}
          ></div>
        ))}
      </div>

      <PasswordCriteria password={password} strength={strength} />
    </div>
  );
};

export default PasswordStrengthMeter;
