import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../components/Kitchen/Login';

describe('Kitchen Login Component', () => {
  it('should render login form', () => {
    render(<Login onLogin={() => {}} />);
    
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('should call onLogin with credentials when form is submitted', async () => {
    const mockOnLogin = vi.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    const usernameInput = screen.getByPlaceholderText('Usuario');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /ingresar/i });

    fireEvent.change(usernameInput, { target: { value: 'kitchen' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockOnLogin).toHaveBeenCalledWith('kitchen', 'password123');
  });

  it('should display error message when error prop is provided', () => {
    render(<Login onLogin={() => {}} error="Credenciales inválidas" />);
    
    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('should disable submit button when loading', () => {
    render(<Login onLogin={() => {}} loading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    expect(submitButton).toBeDisabled();
  });
});
