<?php

use Inertia\Testing\AssertableInertia as Assert;

it('allows guests to view the public About page', function () {
    $this->get('/about')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('about')
        );
});
