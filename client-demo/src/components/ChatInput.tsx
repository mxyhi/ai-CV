import React, { useState } from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  loading = false,
  disabled = false,
  placeholder = '请输入消息...',
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !loading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: '16px',
      borderTop: '1px solid #f0f0f0',
      backgroundColor: '#fff',
    }}>
      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ resize: 'none' }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          disabled={disabled || !message.trim()}
          style={{ height: 'auto' }}
        >
          发送
        </Button>
      </Space.Compact>
      
      <div style={{
        marginTop: '8px',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center',
      }}>
        按 Enter 发送，Shift + Enter 换行
      </div>
    </div>
  );
};

export default ChatInput;
