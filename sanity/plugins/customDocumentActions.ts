// sanity/plugins/customDocumentActions.ts
import type { DocumentActionComponent, DocumentActionProps } from 'sanity';

export const customDocumentActions = (
  prev: DocumentActionComponent[]
): DocumentActionComponent[] => {
  return prev.map((originalAction) => {
    if (originalAction.action === 'publish') {
      // Create a properly typed custom action
      const customAction: DocumentActionComponent = (props: DocumentActionProps) => {
        const originalResult = originalAction(props);
        if (!originalResult) return null;
        
        return {
          ...originalResult,
          label: props.published ? 'Update' : 'Publish',
          title: props.published 
            ? `Update this ${props.type}` 
            : `Publish this ${props.type}`,
        };
      };
      
      // Copy any static properties from the original action
      if (originalAction.action) {
        customAction.action = originalAction.action;
      }
      if (originalAction.displayName) {
        customAction.displayName = originalAction.displayName;
      }
      
      return customAction;
    }
    return originalAction;
  });
};