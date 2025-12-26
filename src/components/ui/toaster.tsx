// Simple toast placeholder - can be enhanced with a proper toast library
export function Toaster() {
  return null;
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
      // Simple alert for now - can be replaced with a proper toast library
      if (variant === 'destructive') {
        console.error(title, description);
      } else {
        console.log(title, description);
      }
      alert(`${title}${description ? '\n' + description : ''}`);
    },
  };
}
