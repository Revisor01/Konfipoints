import { useIonViewWillEnter, useIonViewWillLeave } from "@ionic/react";

export const useHideIonTabBar = () => {
  const onEnter = () => {
    // Hide custom tab bar (not IonTabBar)
    const elements = document.querySelectorAll('[data-tab-bar="true"]');
    elements.forEach(element => {
      element.style.display = 'none';
    });
  };

  const onLeave = () => {
    // Show custom tab bar again
    const elements = document.querySelectorAll('[data-tab-bar="true"]');
    elements.forEach(element => {
      element.style.display = 'flex';
    });
  };

  useIonViewWillEnter(onEnter);
  useIonViewWillLeave(onLeave);
};