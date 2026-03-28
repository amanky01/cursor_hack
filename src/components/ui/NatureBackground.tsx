import React, { useState, useEffect } from 'react';

const NatureBackground: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Layered Gradient Background */}
      <div className="gradientWaves" />
      
      {/* Abstract Leaf Patterns */}
      <div className="leafPatterns" />
      
      {/* Tree Branch Silhouettes */}
      <div className="treeBranches">
        <div className="branchSilhouette branchTopLeft" />
        <div className="branchSilhouette branchTopRight" />
        <div className="branchSilhouette branchBottomLeft" />
        <div className="branchSilhouette branchBottomRight" />
      </div>
      
      {/* Floating Leaves */}
      <div className="floatingLeaves">
        <div className="floatingLeaf" />
        <div className="floatingLeaf" />
        <div className="floatingLeaf" />
        <div className="floatingLeaf" />
        <div className="floatingLeaf" />
        <div className="floatingLeaf" />
      </div>
    </>
  );
};

export default NatureBackground;
