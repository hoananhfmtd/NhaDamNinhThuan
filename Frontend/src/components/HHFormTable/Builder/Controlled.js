

const Input = ({ value, onChange, placeholder, errorMessage }) => {
    return (
      <>
        <textarea
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          style={{ height: '24px', overflowY: 'hidden' }}
        ></textarea>
        {errorMessage && (
          <span
            className="no_print"
            style={{ color: ' red', fontSize: '10px' }}
          >
            {errorMessage}
          </span>
        )}
      </>
    );
};

export const Controlled = { Input };
