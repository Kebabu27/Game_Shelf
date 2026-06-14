import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatWidget from './StatWidget.vue'

describe('StatWidget', () => {
  it('affiche le label et la valeur passés en props', () => {
    const wrapper = mount(StatWidget, { props: { label: 'Total', value: 42 } })
    expect(wrapper.text()).toContain('Total')
    expect(wrapper.text()).toContain('42')
  })

  it('applique la classe accent quand demandé', () => {
    const wrapper = mount(StatWidget, { props: { label: 'X', value: 1, accent: true } })
    expect(wrapper.classes()).toContain('stat--accent')
  })

  it('rend le contenu injecté via le slot par défaut', () => {
    const wrapper = mount(StatWidget, {
      props: { label: 'X', value: 1 },
      slots: { default: '<span class="detail">détail</span>' },
    })
    expect(wrapper.find('.stat__detail').exists()).toBe(true)
    expect(wrapper.find('.detail').text()).toBe('détail')
  })

  it('n’affiche pas le bloc détail sans slot', () => {
    const wrapper = mount(StatWidget, { props: { label: 'X', value: 1 } })
    expect(wrapper.find('.stat__detail').exists()).toBe(false)
  })
})
