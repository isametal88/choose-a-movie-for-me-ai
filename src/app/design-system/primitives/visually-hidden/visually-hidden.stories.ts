import type { Meta, StoryObj } from '@storybook/angular';
import { VisuallyHiddenComponent } from './visually-hidden.component';

const meta: Meta<VisuallyHiddenComponent> = {
  title: 'Design System/Primitives/VisuallyHidden',
  component: VisuallyHiddenComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<VisuallyHiddenComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <p style="color: white">The following text is visually hidden but read by screen readers:</p>
      <ds-visually-hidden>This text is only for screen readers.</ds-visually-hidden>
    `,
  }),
};
