import React from "react";


export function usePdfTitle(targetId) {
  React.useEffect(() => {
    try {
      const node = document.querySelector(`#${targetId}`);
      // node.innerHTML = "<h2>duck</h2>"

      console.log(node,)
    } catch (error) {

    }
  }, [targetId])
}