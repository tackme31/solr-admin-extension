function enableUIImprovement() {
    // query history list
    $('#history select').select2({
        dropdownAutoWidth: true,
        width: '21%',
        templateResult: state => {
            const params = $(state.element).data('params')
            if (!params) {
                return
            }

            const searchParams = new URLSearchParams(params['_query'])
            const highlighted = Array.from(searchParams.entries())
                .map(entry => ({
                    name: `<span class="url-query-param-name">${entry[0]}</span>`,
                    value: `<span class="url-query-param-value">${entry[1]}</span>`
                }))
                .map(entry => `${entry.name}=${entry.value}`)
                .join('&')

            return $(`<span>[${params['_datetime']}] ${highlighted}</span>`)
        }
    })
}