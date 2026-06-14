import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RatingInput from './RatingInput.vue'

describe('RatingInput', () => {
  it('affiche le bon nombre d’étoiles', () => {
    const wrapper = mount(RatingInput, { props: { max: 5 } })
    expect(wrapper.findAll('.rating__star')).toHaveLength(5)
  })

  it('marque comme actives les étoiles jusqu’à la valeur', () => {
    const wrapper = mount(RatingInput, { props: { modelValue: 3 } })
    expect(wrapper.findAll('.rating__star--active')).toHaveLength(3)
  })

  it('émet update:modelValue au clic (liaison bidirectionnelle)', async () => {
    const wrapper = mount(RatingInput, { props: { modelValue: 0 } })
    await wrapper.findAll('.rating__star')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
  })

  it('remet à zéro si on clique la note déjà sélectionnée', async () => {
    const wrapper = mount(RatingInput, { props: { modelValue: 2 } })
    await wrapper.findAll('.rating__star')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it("n'émet rien en lecture seule", async () => {
    const wrapper = mount(RatingInput, { props: { modelValue: 2, readonly: true } })
    await wrapper.findAll('.rating__star')[3].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
