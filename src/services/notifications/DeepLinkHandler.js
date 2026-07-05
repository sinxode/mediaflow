export const DeepLinkHandler = {
  // Dispatches routing redirection based on notification metadata
  handleLink: (metadata, navigate) => {
    if (!metadata || !navigate) return;

    const { item_type, item_id } = metadata;

    if (item_type === 'task') {
      // Redirects task alert directly to tasks list with query param to open task drawer
      navigate(`/tasks?id=${item_id}`);
    } else if (item_type === 'idea') {
      // Directs to Team Hub page, active tab ideas
      navigate(`/team-hub`, { state: { selectTab: 'ideas', selectId: item_id } });
      
      // Broadcast drawer open command
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open_team_hub_item', { 
          detail: { type: 'idea', id: item_id } 
        }));
      }, 150);
    } else if (item_type === 'plan') {
      // Directs to Team Hub page, active tab plans
      navigate(`/team-hub`, { state: { selectTab: 'plans', selectId: item_id } });
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open_team_hub_item', { 
          detail: { type: 'plan', id: item_id } 
        }));
      }, 150);
    } else if (item_type === 'discussion') {
      navigate(`/team-hub`, { state: { selectTab: 'discussion' } });
    } else {
      navigate('/notifications');
    }
  }
};

export default DeepLinkHandler;
