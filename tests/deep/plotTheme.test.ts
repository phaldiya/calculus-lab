import { make2DBaseLayout, make2DXAxis, make2DYAxis, make3DAxis, makePolarAxis } from '../../src/lib/plotTheme';

describe('Plot Theme - Deep', () => {
  describe('make2DXAxis', () => {
    it('returns light mode config', () => {
      const axis = make2DXAxis(false);
      expect(axis.zeroline).toBe(true);
      expect(axis.zerolinecolor).toBe('#64748b');
      expect(axis.gridcolor).toBe('#cbd5e1');
      expect(axis.dtick).toBe(1);
      expect(axis.anchor).toBe('free');
      expect(axis.position).toBe(0.5);
    });

    it('returns dark mode config', () => {
      const axis = make2DXAxis(true);
      expect(axis.zerolinecolor).toBe('#94a3b8');
      expect(axis.gridcolor).toBe('#334155');
    });

    it('applies extra overrides', () => {
      const axis = make2DXAxis(false, { range: [-5, 5], position: 0.3 });
      expect(axis.range).toEqual([-5, 5]);
      expect(axis.position).toBe(0.3);
    });

    it('includes minor grid config', () => {
      const axis = make2DXAxis(false);
      const minor = axis.minor as Record<string, unknown>;
      expect(minor.showgrid).toBe(true);
      expect(minor.dtick).toBe(0.2);
    });
  });

  describe('make2DYAxis', () => {
    it('includes scaleanchor and constrain', () => {
      const axis = make2DYAxis(false);
      expect(axis.scaleanchor).toBe('x');
      expect(axis.scaleratio).toBe(1);
      expect(axis.constrain).toBe('domain');
    });

    it('applies extra overrides on top of defaults', () => {
      const axis = make2DYAxis(false, { range: [-20, 20] });
      expect(axis.range).toEqual([-20, 20]);
      expect(axis.scaleanchor).toBe('x');
    });
  });

  describe('make2DBaseLayout', () => {
    it('returns light mode layout', () => {
      const layout = make2DBaseLayout(false);
      expect(layout.autosize).toBe(true);
      expect(layout.paper_bgcolor).toBe('transparent');
      expect(layout.plot_bgcolor).toBe('#fafbfc');
      expect(layout.dragmode).toBe('pan');
    });

    it('returns dark mode layout', () => {
      const layout = make2DBaseLayout(true);
      expect(layout.plot_bgcolor).toBe('#0d1321');
    });

    it('applies extra overrides', () => {
      const layout = make2DBaseLayout(false, { showlegend: true, hovermode: 'closest' });
      expect(layout.showlegend).toBe(true);
      expect(layout.hovermode).toBe('closest');
    });
  });

  describe('makePolarAxis', () => {
    it('returns light mode polar config', () => {
      const polar = makePolarAxis(false);
      expect(polar.bgcolor).toBe('transparent');
      const radial = polar.radialaxis as Record<string, unknown>;
      expect(radial.color).toBe('#64748b');
    });

    it('returns dark mode polar config', () => {
      const polar = makePolarAxis(true);
      const radial = polar.radialaxis as Record<string, unknown>;
      expect(radial.color).toBe('#94a3b8');
    });
  });

  describe('make3DAxis', () => {
    it('returns light mode 3D axis', () => {
      const axis = make3DAxis(false);
      expect(axis.color).toBe('#64748b');
      expect(axis.gridcolor).toBe('#cbd5e1');
    });

    it('returns dark mode 3D axis', () => {
      const axis = make3DAxis(true);
      expect(axis.color).toBe('#94a3b8');
      expect(axis.gridcolor).toBe('#334155');
    });
  });
});
