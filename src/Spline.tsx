// Spline.js
import { useEffect, useRef, useState, forwardRef } from 'react';

export interface SplineProps {
  scene: string;
  style?: React.CSSProperties;
  onLoad?: (e: any) => void; // Change the type if needed
  onMouseDown?: (e: any) => void; // Change the type if needed
  onMouseUp?: (e: any) => void; // Change the type if needed
  onMouseHover?: (e: any) => void; // Change the type if needed
  onKeyDown?: (e: any) => void; // Change the type if needed
  onKeyUp?: (e: any) => void; // Change the type if needed
  onStart?: (e: any) => void; // Change the type if needed
  onLookAt?: (e: any) => void; // Change the type if needed
  onFollow?: (e: any) => void; // Change the type if needed
  onWheel?: (e: any) => void; // Change the type if needed
  worker: (e: any) => void; // Change the type if needed
  renderOnDemand?: boolean;
}

const Spline = forwardRef<HTMLDivElement, SplineProps>(
  (
    {
      scene,
      style,
      onMouseDown,
      onMouseUp,
      onMouseHover,
      onKeyDown,
      onKeyUp,
      onStart,
      onLookAt,
      onFollow,
      onWheel,
      onLoad,
      worker,
      renderOnDemand = true,
      ...props
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      setIsLoading(true);

      if (!worker) return

      const canvas = canvasRef.current

      let offscreen
      try {
        // @ts-ignore
        offscreen = canvasRef.current.transferControlToOffscreen()
      } catch (e) {
        // Browser doesn't support offscreen canvas at all
        return
      }


      // @ts-ignore
      worker.onmessage = function (event) {
        const { type, payload } = event.data;

        switch (type) {
          case 'initialized':
            break;
          case 'loaded':
            setIsLoading(false);
            onLoad?.(payload);
            break;
          // Add more cases as needed for other events
          default:
            break;
        }
      };

      // Initialize the worker
      // @ts-ignore
      worker.postMessage({
        type: 'init',
        offscreen,
      }, [offscreen]);

      // Load the scene
      // @ts-ignore
      worker.postMessage({
        type: 'load',
        payload: scene,
      });

      // Cleanup logic
      // @ts-ignore
      return () => {
        // @ts-ignore
        worker.postMessage({
          type: 'dispose',
        });
      };
    }, [scene, onLoad, renderOnDemand, worker]);

    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          ...style,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: isLoading ? 'none' : 'block',
            width: '100%',
            height: '100%',
          }}
          {...props}
        />
      </div>
    );
  }
);

export default Spline;
